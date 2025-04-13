import joblib
from fastapi import FastAPI
import os
import xgboost
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException 
import uvicorn

app = FastAPI()

ROOT_DIR = os.getcwd()

models = {}

def init():
    for avl_models in os.listdir(os.path.join(ROOT_DIR,"models")):
        print("Loading", avl_models)
        model_dir = os.path.join(ROOT_DIR, "models", avl_models)
        scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        model = joblib.load(os.path.join(model_dir, "model.joblib"))
        models[avl_models] = [scaler, model]

@app.post("/getPred/{mod}/")
async def pred(mod: str, inputs: dict):
    inputs = [list(inputs.values())]
    if mod not in models:
        raise HTTPException(status_code=404, detail="Model not found")
    try:
        scaled_inputs = models[mod][0].transform(inputs)
        mPred = models[mod][1].predict_proba(scaled_inputs)[0][0]
        return JSONResponse(content={"prediction": float(mPred)*100})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {e}")



# wResult = []
# fResult = []
# wrong = 0
# with open("x_test.txt", 'r') as f:
#     X_test = json.load(f)
# with open('y_test.txt', 'r') as f:
#     y_test = json.load(f)
# for x, y in zip(X_test, y_test):
#     health, result = pred("mod1", [x])
#     if result != y:
#         wrong += 1
#         wResult.append((health, result, y))
    
#     fResult.append((health, y))
# for i in fResult:
#     print(i)

# print(len(X_test), wrong, rones)
# for i in wResult:
#     print(i)


# print(pred("mod1", [[0, 298.9,	308.4,	1632,	31.8,	17]]))

if __name__ == '__main__':
    init()
    print("=" * 30, "INITIALIZATION COMPLETED", "=" * 30)
    uvicorn.run("__main__:app",  port=3000, reload=False)