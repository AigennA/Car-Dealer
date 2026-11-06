namespace CarDealer.Api.Common;

public enum ErrorKind { NotFound, Conflict, Validation, Unauthorized }

/// <summary>A domain error with a user-facing (Swedish) title and optional field errors.</summary>
public sealed record Error(ErrorKind Kind, string Title, string? Detail = null, IReadOnlyDictionary<string, string[]>? Fields = null)
{
    public static Error NotFound(string title, string? detail = null) => new(ErrorKind.NotFound, title, detail);
    public static Error Conflict(string title, string? detail = null) => new(ErrorKind.Conflict, title, detail);
    public static Error Unauthorized(string title) => new(ErrorKind.Unauthorized, title);
    public static Error Validation(string field, string message) =>
        new(ErrorKind.Validation, message, Fields: new Dictionary<string, string[]> { [field] = [message] });
}

/// <summary>
/// Outcome of an application operation: a value or an <see cref="Error"/>.
/// Services return results instead of throwing for expected failures, and
/// never know about HTTP — controllers translate them (ResultExtensions).
/// </summary>
public readonly record struct Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T? value, Error? error) { Value = value; Error = error; }

    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(Error error) => new(default, error);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}

/// <summary>Result without a value (e.g. delete, status change).</summary>
public readonly record struct Result
{
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    private Result(Error? error) => Error = error;

    public static Result Success() => new(null);
    public static implicit operator Result(Error error) => new(error);
}
