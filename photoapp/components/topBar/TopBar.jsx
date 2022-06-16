import React from 'react';
import {
  AppBar, Button, Grid, Toolbar, Typography
} from '@material-ui/core';
import './TopBar.css';
// import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';
// import fetchModel from '../../lib/fetchModelData';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: '',
      top_error: ""
    };
  }
  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (prevProps.currState !== this.props.currState) {
      axios.get(`http://localhost:3000/test/info`).then((res) => {
        this.setState({version: res.data.__v});
      }).catch((err) => {console.log(err.response.data);});}
    
  }

  handleUploadButtonClicked = () => {
    // e.preventDefault();
    if (this.uploadInput.files.length > 0) {

     // Create a DOM form and add the file to it under the name uploadedphoto
     const domForm = new FormData();
     domForm.append('uploadedphoto', this.uploadInput.files[0]);
     axios.post('/photos/new', domForm)
       .then((res) => {
         console.log(res);
         window.location.href = `#/photos/${this.props.currUser._id}`;
       })
       .catch(err => {this.setState({top_error: err});});
    }
  };

  handleLogout = () => {
    this.props.isLoggedIn(undefined);
  };

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container direction='row' justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h5" color="inherit">
                {this.props.currUser ? `Hi, ${this.props.currFirstName}` : "Welcome"}
              </Typography>
              <Typography variant="body2" color="inherit">
                Version: {this.state.version}
              </Typography>
            </Grid>
            <Typography variant="h5" color="inherit">
             {this.props.currUser ?`${this.props.currState} ${this.props.currName}` : <div></div>}
            </Typography>
            <Grid item>
              {this.props.currUser ? <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} className="custom-file-input"/> : <div></div>}
              {this.props.currUser ? <Button onClick={() => {this.handleUploadButtonClicked();}} color="inherit">Upload</Button> : <div></div>}
              {this.props.currUser && this.state.top_error !== "" ? <Typography>{this.state.top_error}</Typography> : <div></div>}
            </Grid>
            {this.props.currUser ? <Button onClick={() => {this.handleLogout();}} color="inherit">Logout</Button> : 'Please Log In'}


          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
