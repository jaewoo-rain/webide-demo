from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from repository.models.user import User


# username으로 유저 조회
def get_by_username(db: Session, username: str) -> User | None:
    return db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()


# id로 유저 조회
def get_by_id(db: Session, user_id: int) -> User | None:
    return db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()


# 회원 생성
def create_user(db: Session, data: dict) -> User:
    obj = User(**data)
    db.add(obj)
    db.flush()
    db.refresh(obj)
    return obj


# 전체 유저 조회
def list_users(db: Session) -> list[User]:
    return list(
        db.execute(
            select(User).order_by(User.id.desc())
        ).scalars().all()
    )


# 유저 삭제
def hard_delete_by_id(db: Session, user_id: int) -> bool:
    result = db.execute(
        delete(User).where(User.id == user_id)
    )
    return (result.rowcount or 0) > 0