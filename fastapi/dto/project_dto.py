from pydantic import BaseModel

class ProjectSimpleOut(BaseModel):
    user_name_raw: str
    project_name_raw: str

    class Config:
        from_attributes = True  # SQLAlchemy ORM 지원 (중요!)