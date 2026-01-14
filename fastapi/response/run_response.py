from pydantic import BaseModel

class RunResponse(BaseModel):
    output: str
    # projectName: str
    # vnc_url: str
    # ws_url: str