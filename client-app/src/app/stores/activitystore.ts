import {  makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import {format} from 'date-fns';


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

   createActivity = async (activity: Activity) => {
      this.loading = true;
      try {
          await agent.Activities.create(activity);
          runInAction(() => {
              this.activityRegistry.set(activity.id, activity);
              this.selectedActivity = activity;
              this.editMode = false;
              this.loading = false;
          })

      } catch (error) {
          console.log(error);
          runInAction(() => {
              this.loading = false;
          });
      }
  }

  updateActivity = async (activity: Activity) => {
      this.loading = true;
      try {
          await agent.Activities.update(activity);
          runInAction(() => {
              this.activityRegistry.set(activity.id, activity);
              this.selectedActivity = activity;
              this.editMode = false;
              this.loading = false;
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
}
