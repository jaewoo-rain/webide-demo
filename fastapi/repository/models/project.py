from sqlalchemy import String, DateTime, BigInteger, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from repository.db import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    user_name_raw: Mapped[str] = mapped_column(String(100), nullable=False)
    project_name_raw: Mapped[str] = mapped_column(String(100), nullable=False)

    owner_slug: Mapped[str] = mapped_column(String(50), nullable=False)
    project_slug: Mapped[str] = mapped_column(String(50), nullable=False)

    key: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    vncUrl: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)

    namespace: Mapped[str] = mapped_column(String(80), nullable=False)
    deploy_name: Mapped[str] = mapped_column(String(120), nullable=False)
    svc_name: Mapped[str] = mapped_column(String(120), nullable=False)
    pvc_name: Mapped[str] = mapped_column(String(120), nullable=False)

    image: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deleted_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

Index("ix_projects_owner_slug", Project.owner_slug)
