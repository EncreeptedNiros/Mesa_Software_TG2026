# Dockerfile
# Usa a imagem oficial do Nginx Alpine (mais leve)
FROM python:latest


WORKDIR /src/Back-End

COPY ./ServiceWA/Back-End/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ServiceWA ./..

CMD ["python3","main.py"]
