import { PagingParams } from './../models/pagination';
import { ActivityFormValues } from './../models/activity';
import { Activity } from '../models/activity';
import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { format } from 'date-fns';
import { store } from './store';
import { Profile } from '../models/profile';
import { Pagination } from '../models/pagination';

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;
  pagination: Pagination | null = null;
  pagingParams = new PagingParams();
  predicate = new Map().set('all',true)

  constructor() {
    makeAutoObservable(this);
  
    reaction(
      () => this.predicate.keys(),
      () => {
        this.pagingParams = new PagingParams();
        this.activityRegistry.clear();
        this.loadActivities();
      }
    )
  }

  setPagingParams=(pagingParams: PagingParams) => {
  this.pagingParams = pagingParams;
  }

  
  setPredicate = (predicate: string, value: string | Date) => {
        const resetPredicate = () => {
            this.predicate.forEach((value, key) => {
                if (key !== 'startDate') this.predicate.delete(key);
            })
        }
        switch (predicate) {
            case 'all':
                resetPredicate();
                this.predicate.set('all', true);
                break;
            case 'isGoing':
                resetPredicate();
                this.predicate.set('isGoing', true);
                break;
            case 'isHost':
                resetPredicate();
                this.predicate.set('isHost', true);
                break;
            case 'startDate':
                this.predicate.delete('startDate');
                this.predicate.set('startDate', value);
        }
    } 

   get axiosParams() {
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());
        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, (value as Date).toISOString())
            } else {
                params.append(key, value);
            }
        })
        return params;
    }

  //get activity by date eg: activity 2 months ago instead 22.02.2022
  get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) =>
            a.date!.getTime() - b.date!.getTime());
    }

//Grouping the activities assign single date for every activities
  get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        )
    }


  //create loading indicator
  loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const result = await agent.Activities.list(this.axiosParams)
      result.data.forEach(activity => {
        this.setActivity(activity);
      })
      this.setPagination(result.pagination);
      this.setLoadingInitial(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInitial(false);
    }
  };

  setPagination = (pagination: Pagination) => {
    this.pagination = pagination;
  }
  

  //loading activity
  loadActivity = async (id: string) => {
    let activity = this.getActivity((id));
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        })
        this.setLoadingInitial(false)
        return activity;
      } catch (err) {
        console.log(err);
          this.setLoadingInitial(false)
      }
    }
  }

  private setActivity = (activity: Activity) => {
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees!.some(
        a => a.username === user.username
      )
      activity.isHost = activity.hostUsername === user.username;
      activity.host = activity.attendees?.find(x => x.username === activity.hostUsername);
    }
    activity.date = new Date(activity.date!)
       this.activityRegistry.set(activity.id,activity);
  }

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  }

  //set a loading 
  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  //create an activity
  createActivity = async (activity: ActivityFormValues) => {

    const user = store.userStore.user;
    const attendee = new Profile(user!)

    // activity.id = uuid();
    try {
      await agent.Activities.create(activity);
      const newActivity = new Activity(activity);
      newActivity.hostUsername = user!.username;
      newActivity.attendees = [attendee];
      this.setActivity(newActivity);
      runInAction(() => {
        this.selectedActivity = newActivity;
      })
    } catch (err) {
      console.log(err);
    }
  }

  // update an activity
  updateActivity = async (activity: ActivityFormValues) => {
    this.loading = true;
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        if (activity.id) {
          let updateActivity = { ...this.getActivity(activity.id), ...activity }
          this.activityRegistry.set(activity.id, updateActivity as Activity);
          this.selectedActivity = updateActivity as Activity;
        }
      })
    } catch (err) {
      console.log(err);
    }
  }

  deleteActivity = async (id: string) => {
    this.loading = true;
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id)
        this.loading = false;
      })
    } catch (err) {
      console.log(err);
      runInAction(() => {
        this.loading = false;
      })
    }
  }

  updateAttedance = async () => {
    const user = store.userStore.user;
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(a => a.username !== user?.username)
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }
        this.activityRegistry.set(this.selectedActivity!.id,this.selectedActivity!)
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => this.loading = false);
    }
  }

  //Cancel Attendance
  cancelActivityToggle = async () => {
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled;
        this.activityRegistry.set(this.selectedActivity!.id,this.selectedActivity!)
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => this.loading = false);
    }
  }
  clearSelectedActivity = () => {
    this.selectedActivity = undefined;
  }

  updateAttendeeFollowing = (username: string) => {
    this.activityRegistry.forEach(activity => {
      activity.attendees.forEach(attendee => {
        if (attendee.username === username) {
          attendee.following ? attendee.followersCount-- : attendee.followersCount++;
          attendee.following = !attendee.following;
        }
      })
    })
  }
}
