from pydantic import BaseModel
from typing import List, Optional

class RunFileItem(BaseModel):
    name: Optional[str] = None
    path: Optional[List[str]] = None
    relative_path: Optional[str] = None
    code: str = ""

class RunRequest(BaseModel):
    projectKey: str
    entryFile: str
    files: List[RunFileItem]