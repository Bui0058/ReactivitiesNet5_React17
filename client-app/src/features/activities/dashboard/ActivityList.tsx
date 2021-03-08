import { observer } from "mobx-react-lite";
import React, { Fragment } from "react";
import { Header } from "semantic-ui-react";
import { useStore } from "../../../app/stores/stores";
import ActivityListItem from "./ActivityListItem";

function ActivityList() {
  const { activityStore } = useStore();
  const { groupoActivities } = activityStore;

  return (
    <>
      {groupoActivities.map(([group, activities]) => (
        <Fragment key={group}>
          <Header sub color="teal">
            {group}
          </Header>

          {activities.map((activity) => (
            <ActivityListItem activity={activity} key={activity.id} />
          ))}
        </Fragment>
      ))}
    </>
  );
}

export default observer(ActivityList);
