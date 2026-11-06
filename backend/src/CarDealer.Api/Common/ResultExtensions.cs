using Microsoft.AspNetCore.Mvc;

namespace CarDealer.Api.Common;

/// <summary>Maps application results to HTTP responses (ProblemDetails for errors).</summary>
public static class ResultExtensions
{
    public static ActionResult<T> ToActionResult<T>(this ControllerBase c, Result<T> result, Func<T, ActionResult<T>>? onSuccess = null) =>
        result.IsSuccess ? (onSuccess?.Invoke(result.Value!) ?? c.Ok(result.Value)) : c.ToProblem(result.Error!);

    public static IActionResult ToActionResult(this ControllerBase c, Result result) =>
        result.IsSuccess ? c.NoContent() : c.ToProblem(result.Error!);

    public static ObjectResult ToProblem(this ControllerBase c, Error error)
    {
        if (error.Kind == ErrorKind.Validation && error.Fields is { } fields)
        {
            foreach (var (field, messages) in fields)
                foreach (var m in messages) c.ModelState.AddModelError(field, m);
            return (ObjectResult)c.ValidationProblem(c.ModelState);
        }
        var status = error.Kind switch
        {
            ErrorKind.NotFound => StatusCodes.Status404NotFound,
            ErrorKind.Conflict => StatusCodes.Status409Conflict,
            ErrorKind.Unauthorized => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status400BadRequest,
        };
        return c.Problem(statusCode: status, title: error.Title, detail: error.Detail);
    }
}
