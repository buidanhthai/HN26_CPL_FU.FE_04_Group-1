using FluentValidation;
using backend.Application.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace backend.Infrastructure.Middleware
{
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
                ValidationException validationEx => new
                {
                    Status = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ.",
                    Errors = (object?)validationEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })
                },
                BusinessException businessEx => new
                {
                    Status = StatusCodes.Status400BadRequest,
                    Message = businessEx.Message,
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
