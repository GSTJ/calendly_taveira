<div>
  {this.kobject.custom ? (
    <Segment>
      <Grid>
        <Column size="eight">
          <h4>Invitation Information</h4>
          <BasicField label="Type" value={this.kobject.custom.eventTypeStr} />
          <BasicField label="Name" value={this.kobject.custom.eventNameStr} />
          <BasicField
            label="Description"
            value={this.kobject.custom.eventDescriptionStr}
          />
          <BasicField
            label="Duration"
            value={`${this.kobject.custom.eventDurationNum.toString()} minutes`}
          />
          <BasicField
            label="Start time"
            value={this.kobject.custom.startTimeAt}
          />
          <BasicField label="End time" value={this.kobject.custom.endTimeAt} />
        </Column>
        <Column size="eight">
          <h4>Cancelation Details</h4>
          <BasicField
            label="Was canceled?"
            value={this.kobject.custom.canceledStr}
          />
          <BasicField
            label="Reason"
            value={this.kobject.custom.cancelReasonStr}
          />
          <BasicField
            label="Date canceled"
            value={this.kobject.custom.canceledDateStr}
          />
        </Column>
      </Grid>
    </Segment>
  ) : null}
</div>;
