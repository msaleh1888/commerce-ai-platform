from commerce_ai_worker.tasks.health import health_check


def main() -> None:
    result = health_check.delay()
    print(f"task_id={result.id}")
    print(f"result={result.get(timeout=10)}")


if __name__ == "__main__":
    main()
