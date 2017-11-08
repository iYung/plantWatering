import React, { Component } from 'react';
import { Container, Segment, Input, Label, Icon } from 'semantic-ui-react'
import Axios from 'axios';
import Qs from 'qs';
import Chart from 'chart.js';

const fluidStyle = {
  "border-top-left-radius": "0.285714rem",
  "border-top-right-radius": "0.285714rem",
  "border-bottom-right-radius": "0.285714rem",
  "order-bottom-left-radius": "0.285714rem",
  "background": "linear-gradient(to right, #fcfcfc 14%,#ebf1f6 21%,#abd3ee 51%,#031799 100%,#89c3eb 100%,#84879b 100%,#575d93 101%,#89c3eb 101%)"
}

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      goalMoisture: 0,
      moisture: 0,
      prevMoisture: []
    };
  }
  
  componentDidUpdate(){
    if (this.state.name !== ""){
      console.log("Rerendered");
      console.log(this.state.prevMoisture);
      var ctx = document.getElementById("myChart").getContext("2d");
      var labels = [];
      for (var i = 0; i > -25; i--){
        labels.push(i * 10);
      }
      labels = labels.reverse();
      var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: this.state.name + "'s Moisture Levels",
              data: this.state.prevMoisture,
              backgroundColor: [
                  'blue'
              ],
              borderColor: [
                  'black'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              xAxes: [{
                  scaleLabel: {display: true,
                  labelString: "Seconds from present"}
              }],
              yAxes: [{
                  scaleLabel: {display: true,
                  labelString: "Moisture sensor value"}
              }]
          },
          tooltips: {
            enabled: false
          }
      }
    })
  }
  }
  
  login = () => {
    const self = this;
    const name = document.getElementById("plantInput").value;
    Axios.post('/api/login', Qs.stringify({ 'name': name }))
      .then(res => {
        if (res.data.success) {
          console.log("Logged in!");
          self.setState({name: name, goalMoisture: res.data.goalMoisture, moisture: res.data.moisture, prevMoisture: res.data.prevMoisture});
        } else {
          alert("Plant not found!");
        }
      });
  }
  
  refresh = () => {
    const self = this;
    Axios.post('/api/login', Qs.stringify({ 'name': this.state.name }))
      .then(res => {
        if (res.data.success) {
          console.log("Refreshed!");
          self.setState({ goalMoisture: res.data.goalMoisture, moisture: res.data.moisture, prevMoisture: res.data.prevMoisture});
        } else {
          alert("Error occured, please refresh the page!");
        }
      });
  }
  
  updateGoalMoisture = () => {
    const newGoal = document.getElementById("newGoalMosture").value;
    Axios.post('/api/updategoal', Qs.stringify({ 'name': this.state.name, 'goalMoisture': newGoal }))
      .then(res => {
        if (res.data.success) {
          alert("Update success!");
        } else {
          alert("Update failed!");
        }
      });
  }
  
  render() {
    let display = <Segment.Group style={{"margin-top": "5%"}}>
        <Segment inverted>Enter plant name below:</Segment>
        <Segment>
          <p><Input id="plantInput" fluid type="text" placeholder="Plant name..." /></p>
          <Label onClick={this.login}>Submit</Label>
        </Segment>
      </Segment.Group>;
    if (this.state.name !== ""){
      display = <Segment.Group style={{"margin-top": "5%"}}>
        <Segment inverted>{this.state.name}</Segment>
        <Segment>
          <p>Current moisture:</p>
          <p><Input style={fluidStyle} className="fluidSlider" fluid type="range" min="0" max="4095" disabled="true" defaultValue={this.state.moisture}/></p>
          <p>Set new desired moisture:</p>
          <p><Input id="newGoalMosture" fluid style={fluidStyle} className="fluidSlider" type="range" min="0" max="4095"  defaultValue={this.state.goalMoisture}/></p>
          <Label onClick={this.updateGoalMoisture}>Submit</Label><Label onClick={this.refresh}>Refresh</Label>
          <p><canvas id="myChart" width="600" height="300"></canvas></p>
        </Segment>
      </Segment.Group>;
    }
    return (
      <Container text>
      {display}
      </Container>
    );
  }
}

export default App;
