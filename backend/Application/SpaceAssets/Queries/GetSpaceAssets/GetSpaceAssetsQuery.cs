using MediatR;
using backend.DTOs;
using System.Collections.Generic;

namespace backend.Application.SpaceAssets.Queries.GetSpaceAssets
{
    public record GetSpaceAssetsQuery : IRequest<List<SpaceAssetDto>>;
}
