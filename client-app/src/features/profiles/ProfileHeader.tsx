import { observer } from "mobx-react-lite";
import React from "react";
import {
  Divider,
  Grid,
  Header,
  Item,
  Segment,
  Statistic,
} from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import FollowButton from "./FollowButton";

interface Props {
  profile: Profile;
}

export default observer(function ProfileHeader({ profile }: Props) {
  return (
    <Segment>
      <Grid>
        <Grid.Column width={12}>
          <Item.Group>
            <Item>
              <Item.Image
                avatar
                size="small"
                src={profile.image || "/assets/user.png"}
              />
              <Item.Content verticalAlign="middle">
                <Header as="h1" content={profile.displayName} />
              </Item.Content>
            </Item>
          </Item.Group>
        </Grid.Column>
        <Grid.Column width={4}>
          <Statistic.Group widths={2}>
            <Statistic label="Followers" value={profile.followersCount} />
            <Statistic label="Following" value={profile.followingCount} />
          </Statistic.Group>
          <Divider />
          <FollowButton profile={profile} />
        </Grid.Column>
      </Grid>
    </Segment>
  );
});

// import { observer } from "mobx-react-lite";
// import React from "react";
// import {
//   Button,
//   Divider,
//   Grid,
//   Header,
//   Item,
//   Reveal,
//   Segment,
//   Statistic,
// } from "semantic-ui-react";
// import { Profile } from "../../app/models/profile";

// interface Props {
//   profile: Profile;
// }

// export default observer(function ProfileHeader({ profile }: Props) {
//   return (
//     <Segment>
//       <Grid>
//         <Grid.Column width={12}>
//           <Item.Group>
//             <Item>
//               <Item.Image
//                 avatar
//                 size="small"
//                 src={profile.image || "/assets/user.png"}
//               />
//               <Item.Content verticalAlign="middle">
//                 <Header as="h1" content={profile.displayName} />
//               </Item.Content>
//             </Item>
//           </Item.Group>
//         </Grid.Column>
//         <Grid.Column width={4}>
//           <Statistic.Group widths={2}>
//             <Statistic label="Followers" value="5" />
//             <Statistic label="Followers" value="42" />
//           </Statistic.Group>
//           <Divider />
//           <Reveal animated="move">
//             <Reveal.Content visible style={{ width: "100%" }}>
//               <Button fluid color="violet" content="Following" />
//             </Reveal.Content>
//             <Reveal.Content hidden style={{ width: "100%" }}>
//               <Button
//                 fluid
//                 color={true ? "green" : "green"}
//                 content={true ? "follow" : "unfollow"}
//               />
//             </Reveal.Content>
//           </Reveal>
//         </Grid.Column>
//       </Grid>
//     </Segment>
//   );
// });
