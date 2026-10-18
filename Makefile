.PHONY: serve validate test runner-test

serve:
	python3 -m http.server 8000

validate:
	node tools/validate_data.js

test:
	node tools/validate_data.js
	node tools/test_runtime.js

runner-test:
	cd runner-service && PYTHONPATH=. python3 -m pytest -q
