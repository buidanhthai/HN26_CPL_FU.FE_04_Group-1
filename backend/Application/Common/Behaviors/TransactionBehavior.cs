using MediatR;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Application.Common.Behaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly AppDbContext _dbContext;

        public TransactionBehavior(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (!typeof(TRequest).Name.EndsWith("Command"))
            {
                return await next();
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var response = await next();
                
                await transaction.CommitAsync(cancellationToken);
                return response;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
