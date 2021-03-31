import {  makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import {format} from 'date-fns';
import { store } from "./stores";
import { Profile } from "../models/profile";


export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined  = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
      return Array.from(this.activityRegistry.values())
                    .sort((a,b) => a.date!.getTime() - b.date!.getTime());
  }

  get groupoActivities () {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, 'dd MMM yyyy');
        activities[date] = activities[date] ? [...activities[date], activity] : [activity];
        return activities;
      }, {} as {[key: string]: Activity[]})
    );
  }

  loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      activities.forEach((activity) => {
        this.setActivity(activity);
      }); //change the date of each activity (only take the date not time) to put on form.
      this.setLoadingInitial(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInitial(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) { // this is the case when activity also in the memory, no need to fetch from API.
      this.selectedActivity = activity;
      return activity;
    } else { //when refresh the page or access to a link
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;

        })
        this.setLoadingInitial(false);
        return activity;        
      } catch(error) {
        console.log(error);  
        this.setLoadingInitial(false);     
      }
    }
  }

  private setActivity = (activity: Activity) => {
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees!.some(
        a => a.username === user.userName
      );
      activity.isHost = activity.hostUsername === user.userName;
      activity.host = activity.attendees!.find(x => x.username === activity.hostUsername);
    }
    activity.date = new Date(activity.date!);
    this.activityRegistry.set(activity.id, activity);
  }

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  }

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  }; // this is a second  approach instead of runInActin() while updating an observalbe inside another action. 
  // by creating the own action of the behavior need to update. 

   createActivity = async (activity: ActivityFormValues) => {
      const user = store.userStore.user;
      const attendee = new Profile(user!);
      try {
          await agent.Activities.create(activity);
          const newActivity = new Activity(activity);
          newActivity.hostUsername = user!.userName;
          newActivity.attendees = [attendee];
          this.setActivity(newActivity);
          runInAction(() => {
              this.selectedActivity = newActivity;
          })

      } catch (error) {
          console.log(error);
          runInAction(() => {
              this.loading = false;
          });
      }
  }

  updateActivity = async (activity: ActivityFormValues) => {
      try {
          await agent.Activities.update(activity);
          runInAction(() => {
            if (activity.id) {
              //using spread operator to overide the vlue of current activity with new activity
              let updatedActivity = {...this.getActivity(activity.id), ...activity};
              this.activityRegistry.set(activity.id, updatedActivity as Activity);
              this.selectedActivity = updatedActivity as Activity;
            }
          })

      } catch(error) {
          console.log(error); 
          runInAction(() => {
            this.loading = false;
        });        
      }      
  }

  deleteActivity = async (id: string) => {
      this.loading = true;
      try{
          await agent.Activities.delete(id);
          runInAction(() => {
            this.activityRegistry.delete(id);
            this.loading = false;        

          });

      } catch (error) {
          console.log(error);
          runInAction(() => {
            this.loading = false;
        });       
      }
  }

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;
    try{
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) { //remove profile from attendees
          this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(a =>
                                               a.username !== user?.userName);
          this.selectedActivity.isGoing = false;
        } else { //create a Profile then add to attendees of activity
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }        
        this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => this.loading = false);
    }
  }

  cancelActivityToggle = async () => {
    this.loading = true;
    try{
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled;
        this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
      })
    } catch (error) {
      console.log(error);
    }
    finally{
      runInAction(() => this.loading = false);
    }
    
  }
 
}
