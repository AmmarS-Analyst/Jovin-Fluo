"""Export endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse, StreamingResponse, Response
from sqlalchemy.orm import Session
import pandas as pd
import os
import io
from app.core.database import get_db
from app.infrastructure.database.models import Dataset as DatasetModel, Project as ProjectModel, Visualization as VizModel, AnonymizedData as AnonymizedDataModel
from app.core.security import decode_access_token
from fastapi import Header
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime

router = APIRouter()


def get_current_user_id(authorization: str = Header(None)) -> int:
    """Get current user ID from token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return payload.get("user_id")


@router.get("/dataset/{dataset_id}/csv")
async def export_dataset_csv(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Export dataset as CSV."""
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False  # Exclude soft-deleted datasets
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Read and export file
    try:
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path)
        else:
            df = pd.read_csv(dataset.file_path)
        
        # Convert to CSV
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={dataset.name}.csv"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting file: {str(e)}"
        )


@router.get("/dataset/{dataset_id}/pdf")
async def export_dataset_pdf(
    dataset_id: int,
    visualization_ids: str = Query(None, description="Comma-separated list of visualization IDs to include"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Export dataset analysis report as PDF."""
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False  # Exclude soft-deleted datasets
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    try:
        # Read dataset
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path, nrows=1000)  # Limit for PDF
        else:
            df = pd.read_csv(dataset.file_path, nrows=1000)
        
        # Get profile data
        profile_data = dataset.profile_data or {}
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0ea5e9'),
            spaceAfter=30,
        )
        story.append(Paragraph("Data Analysis Report", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Dataset Info
        story.append(Paragraph(f"<b>Dataset:</b> {dataset.name}", styles['Normal']))
        story.append(Paragraph(f"<b>Project:</b> {project.name}", styles['Normal']))
        story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Summary Statistics
        story.append(Paragraph("<b>Summary Statistics</b>", styles['Heading2']))
        summary_data = [
            ['Metric', 'Value'],
            ['Total Rows', str(dataset.row_count or len(df))],
            ['Total Columns', str(dataset.column_count or len(df.columns))],
            ['File Size', f"{(dataset.file_size / 1024 / 1024):.2f} MB"],
        ]
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Column Information
        if profile_data.get('columns'):
            story.append(Paragraph("<b>Column Information</b>", styles['Heading2']))
            col_data = [['Column', 'Type', 'Null %', 'Distinct']]
            for col in profile_data['columns'][:20]:  # Limit to 20 columns
                col_data.append([
                    col.get('name', ''),
                    col.get('type', ''),
                    f"{col.get('null_percentage', 0):.2f}%",
                    str(col.get('distinct_count', '-'))
                ])
            
            col_table = Table(col_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            col_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(col_table)
            story.append(PageBreak())
        
        # Data Preview (first 20 rows)
        story.append(Paragraph("<b>Data Preview (First 20 Rows)</b>", styles['Heading2']))
        preview_df = df.head(20)
        preview_data = [list(preview_df.columns)]
        for _, row in preview_df.iterrows():
            preview_data.append([str(val)[:50] for val in row.values])  # Truncate long values
        
        # Adjust column widths
        num_cols = len(preview_df.columns)
        col_width = 6*inch / num_cols if num_cols > 0 else 1*inch
        
        preview_table = Table(preview_data, colWidths=[col_width] * num_cols)
        preview_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        story.append(preview_table)
        story.append(PageBreak())
        
        # Visualizations Section - only include selected ones
        viz_ids = []
        if visualization_ids:
            try:
                viz_ids = [int(id.strip()) for id in visualization_ids.split(',') if id.strip()]
            except ValueError:
                pass
        
        if viz_ids:
            visualizations = db.query(VizModel).filter(
                VizModel.project_id == project.id,
                VizModel.id.in_(viz_ids)
            ).all()
        else:
            # If no IDs provided, include all visualizations
            visualizations = db.query(VizModel).filter(
                VizModel.project_id == project.id
            ).all()
        
        if visualizations:
            story.append(Paragraph("<b>Visualizations</b>", styles['Heading2']))
            story.append(Spacer(1, 0.2*inch))
            
            for viz in visualizations:
                story.append(Paragraph(f"<b>{viz.name}</b>", styles['Heading3']))
                story.append(Paragraph(f"Type: {viz.type.upper()}", styles['Normal']))
                if viz.config:
                    config = viz.config
                    if config.get('x_axis') and config.get('y_axis'):
                        story.append(Paragraph(
                            f"X-Axis: {config.get('x_axis')} | Y-Axis: {config.get('y_axis')}",
                            styles['Normal']
                        ))
                story.append(Spacer(1, 0.15*inch))
            
            story.append(PageBreak())
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=analysis_report_{dataset.name}.pdf"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )


@router.delete("/report/{dataset_id}", status_code=status.HTTP_200_OK)
async def delete_report(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Archive a report to anonymized_data (soft delete).
    
    Reports are generated on-demand, so we archive the dataset's report metadata
    when user requests deletion.
    """
    from datetime import datetime
    
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found or already deleted"
        )
    
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get associated visualizations for the report
    visualizations = db.query(VizModel).filter(VizModel.project_id == project.id).all()
    
    # Archive report metadata to anonymized_data
    anonymized_entry = AnonymizedDataModel(
        data_type='report',
        original_id=dataset.id,
        deleted_by=user_id,
        project_id=dataset.project_id,
        data_metadata={
            'dataset_name': dataset.name,
            'dataset_id': dataset.id,
            'project_id': dataset.project_id,
            'project_name': project.name,
            'report_type': 'analysis_report',
            'row_count': dataset.row_count,
            'column_count': dataset.column_count,
            'profile_data': dataset.profile_data,
            'visualizations_count': len(visualizations),
            'visualizations': [
                {
                    'id': viz.id,
                    'name': viz.name,
                    'type': viz.type,
                    'config': viz.config
                } for viz in visualizations
            ],
            'created_at': datetime.utcnow().isoformat(),
            'action': 'report_deleted',
        },
        is_deleted=True,
        deleted_at=datetime.utcnow(),
    )
    db.add(anonymized_entry)
    db.commit()
    
    return {"message": "Report archived successfully", "archived": True}
