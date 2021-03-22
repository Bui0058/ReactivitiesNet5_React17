using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application;
using Application.Activities;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    { 

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetActivities()
        {
            return HandleResult(await Mediator.Send(new List.Query()));
        }

        
        [HttpGet("{id}")] // activites/id
        public async Task<IActionResult> GetActivity(Guid id)
        {            
            return HandleResult(await Mediator.Send(new Details.Query{Id = id}));
        }

        [HttpPost]
        public async Task<IActionResult> CreateAcitivty(Activity activity)
        {
            return HandleResult(await Mediator.Send(new Create.Command{Activity = activity}));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id; // add id  to activity in the put payload before pass to Mediator
            return HandleResult(await Mediator.Send(new Edit.Command{Activity = activity}));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(Guid id) 
        {
            return HandleResult(await Mediator.Send(new Delete.Command{Id = id}));
        }
    }
}