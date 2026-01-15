from pydantic import BaseModel

class RunResponse(BaseModel):
    mode: str
    # projectName: str
    # vnc_url: str
    # ws_url: str