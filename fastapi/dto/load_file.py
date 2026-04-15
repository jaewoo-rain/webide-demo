from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal

class FileNode(BaseModel):
    id: str
    name: str
    type: Literal["file", "folder"]
    children: List["FileNode"] = Field(default_factory=list)

class FileMapItem(BaseModel):
    id: str
    name: str
    type: Literal["file", "folder"]
    path: str
    relative_path: str
    content: Optional[str] = None

class LoadProjectFilesResponse(BaseModel):
    tree: FileNode
    fileMap: Dict[str, FileMapItem]