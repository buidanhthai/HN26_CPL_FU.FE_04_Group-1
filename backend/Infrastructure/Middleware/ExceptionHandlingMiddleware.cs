using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace backend.Infrastructure.Middleware
{
    public class BusinessException : Exception
    {
        public BusinessException() : base() { }
        public BusinessException(string message) : base(message) { }
        public BusinessException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var response = exception switch
            {
                BusinessException businessEx => new
                {
                    Status = StatusCodes.Status400BadRequest,
                    Message = businessEx.Message,
                    Errors = (object?)null
                },
                KeyNotFoundException keyNotFoundEx => new
                {
                    Status = StatusCodes.Status404NotFound,
                    Message = keyNotFoundEx.Message,
                    Errors = (object?)null
                },
                ArgumentException argEx => new
                {
                    Status = StatusCodes.Status400BadRequest,
                    Message = argEx.Message,
                    Errors = (object?)null
                },
                InvalidOperationException opEx => new
                {
                    Status = StatusCodes.Status400BadRequest,
                    Message = opEx.Message,
                    Errors = (object?)null
                },
                UnauthorizedAccessException authEx => new
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Message = authEx.Message,
                    Errors = (object?)null
                },
                _ => new
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Message = "Đã xảy ra lỗi hệ thống nghiêm trọng.",
                    Errors = (object?)null
                }
            };

            context.Response.StatusCode = (int)response.Status;
            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
