.PHONY: setup dev test build demo clean

setup:
	python -m pip install -r requirements.txt
	cd frontend && npm install

dev:
	python -m uvicorn backend.blastradius.api.main:app --host 0.0.0.0 --port 8000 --reload &
	cd frontend && npm run dev

test:
	python -m pytest tests/ -v

build:
	cd frontend && npm run build

demo:
	python -m uvicorn backend.blastradius.api.main:app --host 0.0.0.0 --port 8000 &
	cd frontend && npx vite preview --port 5173 --host 0.0.0.0

clean:
	rm -rf dist frontend/dist .pytest_cache
