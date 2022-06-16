import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/loginRegister';
import Favorites from './components/Favorites/favorites';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currState: null,
      currName: 'Luis\'s Photo Sharing App',
      currUser: null,
      currFirstName: '',

    };
    this.isLoggedIn = this.isLoggedIn.bind(this);
  }
  handleChange = (pageName, userName) => {
    this.setState({currState: pageName});
    this.setState({currName: userName});
  };
  isLoggedIn = (user) => {
    this.setState({currUser: user});
    if(user) {
      this.setState({currFirstName: user.first_name});
    }
  };
  
  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar currState={this.state.currState} currName={this.state.currName} 
          currFirstName={this.state.currFirstName} currUser={this.state.currUser} isLoggedIn={this.isLoggedIn}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            {
              this.state.currUser ? 
                <UserList handleChange={this.handleChange}/>
              :
                <div></div>
            }
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              <Route path="/login-register"
                render={ props => <LoginRegister isLoggedIn={this.isLoggedIn} handleChange={this.handleChange} {...props} /> }
              />
              {
              this.state.currUser ? 
                <Route path="/users/:userId" render={ props => <UserDetail handleChange={this.handleChange} {...props} /> }/>
              :
                <Redirect path="/users/:id" to="/login-register" />
              }

              {
              this.state.currUser ?
                <Route path="/photos/:userId" render ={ props => <UserPhotos handleChange={this.handleChange} {...props} /> }/>
              :
                <Redirect path="/photos/:userId" to="/login-register" />
              }
              {
              this.state.currUser ? 
                <Route path="/favorites" render={ props => <Favorites handleChange={this.handleChange} {...props} /> }/>
              :
                <Redirect path="/users/:id" to="/login-register" />
              }
              {
              this.state.currUser ? (
                <Route path="/" render={() => (
                  <Typography variant="body1">
                    Welcome to Luis&apos; photosharing app! 
                  </Typography>
                  )}/>
              )
              :
                <Redirect path="/" to="/login-register" />
              }
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
