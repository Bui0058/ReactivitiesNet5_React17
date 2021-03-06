using System.Linq;
using Application.Activities;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>();
            // d is destitation member;  o is options; s is source
            // Maping from Activity to ActivityDto
            CreateMap<Activity, ActivityDto>()
                .ForMember(d => d.HostUsername, o => o.MapFrom(s => 
                            s.Attendees.FirstOrDefault(x => x.IsHost).AppUser.UserName));    
            // Mapping from ActivityAttendee to Profile inside of Activity Dto  
            CreateMap<ActivityAttendee, Profiles.Profile>()
                .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.AppUser.DisplayName))   
                .ForMember(d => d.Username, o => o.MapFrom(s => s.AppUser.UserName))   
                .ForMember(d => d.Bio, o => o.MapFrom(s => s.AppUser.Bio));   
        }
    }
}