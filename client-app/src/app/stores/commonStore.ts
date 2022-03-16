import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError";

export default class CommonStore {
    error: ServerError | null = null;
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt',token)
                } else {
                    window.localStorage.removeItem('jwt')
                }
            }
        )
    }

    setServerError = (error: ServerError) => {
        this.error = error;
    }

    setToken = (token: string | null) => {
        this.token = token;
    }

   setAppLoaded = () => {
        this.appLoaded = true;
    }
}

// import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
// import { makeAutoObservable, runInAction } from "mobx";
// import { ChatComment } from "../models/comment";
// import { store } from "./store";

// export default class CommentStore {
//     comments: ChatComment[] = [];
//     hubConnection: HubConnection | null = null;

//     constructor() {
//         makeAutoObservable(this);
//     }

//     createHubConnection = (activityId: string) => {
//         if (store.activityStore.selectedActivity) {
//             this.hubConnection = new HubConnectionBuilder()
//                 .withUrl(process.env.REACT_APP_CHAT_URL + '?activityId=' + activityId, {
//                     accessTokenFactory: () => store.userStore.user?.token!
//                 })
//                 .withAutomaticReconnect()
//                 .configureLogging(LogLevel.Information)
//                 .build();

//             this.hubConnection.start().catch(error => console.log('Error establishing the connection: ', error));

//             this.hubConnection.on('LoadComments', (comments: ChatComment[]) => {
//                 runInAction(() => {
//                     comments.forEach(comment => {
//                         comment.createdAt = new Date(comment.createdAt + 'Z');
//                     })
//                     this.comments = comments
//                 });
//             })

//             this.hubConnection.on('ReceiveComment', (comment: ChatComment) => {
//                 runInAction(() => {
//                     comment.createdAt = new Date(comment.createdAt);
//                     this.comments.unshift(comment)
//                 });
//             })
//         }
//     }

//     stopHubConnection = () => {
//         this.hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
//     }

//     clearComments = () => {
//         this.comments = [];
//         this.stopHubConnection();
//     }

//     addComment = async (values: any) => {
//         values.activityId = store.activityStore.selectedActivity?.id;
//         try {
//             await this.hubConnection?.invoke('SendComment', values);
//         } catch (error) {
//             console.log(error);
//         }
//     }
    
// }