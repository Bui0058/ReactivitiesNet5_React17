using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {

    }
    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DataContext _dbContext;
        public IsHostRequirementHandler(DataContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Task.CompletedTask; //user not exist

            var activityId = Guid.Parse(_httpContextAccessor.HttpContext?.Request.RouteValues
                    .SingleOrDefault(x => x.Key == "id").Value?.ToString()); //turn Guid string into Guid Object
            
            var attendee = _dbContext.ActivityAttendees
                .AsNoTracking() //we don't want to save in memory otherwise the edit handle will  delete the attendees
                .SingleOrDefaultAsync(x => x.AppUserId == userId && x.ActivityId == activityId)
                .Result;

            if (attendee == null) return Task.CompletedTask;

            if (attendee.IsHost) context.Succeed(requirement); // the User is host and can go ahead to change activity

            return Task.CompletedTask;
        }
    }
}