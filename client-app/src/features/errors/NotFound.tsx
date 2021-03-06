import React from "react";
import { Link } from "react-router-dom";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function NotFound() {
  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="search" />
        Error 404: Oops! The page you are looking for cannot be found..
      </Header>
      <Segment.Inline>
        <Button as={Link} to="/activities" primary>
          Return to activities page
        </Button>
      </Segment.Inline>
    </Segment>
  );
}
