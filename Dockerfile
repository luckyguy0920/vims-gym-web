FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY index.html server.py nutrition.js plan28.js autoflow.js quickinbody.js favicon.svg ./
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
