import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  // Typography,
}
from '@material-ui/core';
import './userList.css';
import {Link} from 'react-router-dom';
// import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allUsers: undefined,
      active_user: undefined
    };
  }

  componentDidMount() {
    axios.get('/user/list').then((response) => {this.setState({allUsers: response.data});})
    .catch((err) => {console.log(err);});
    axios.get('/loginuser').then((response) => {
      this.setState({active_user: response.data});
    }).catch((err) => {console.log(err);});
  }

  render() {
    let users;
    if (this.state.allUsers !== undefined) {
      users = this.state.allUsers.map(user => (
        <Link to={`/users/${user._id}`} key={user._id} onClick={()=>{this.props.handleChange("Details of ", `${user.first_name} ${user.last_name}`);}}>
          <ListItem>
            <ListItemText primary={`${user.first_name} ${user.last_name}`} />
          </ListItem>
          <Divider />
        </Link>
      ));
    }
    let favs;
    // console.log(this.state.active_user);
    if (this.state.active_user !== undefined) {
      // console.log(this.state.active_user.favorites);
      favs = 
      (
        <Link to={`/favorites`} key={this.state.active_user._id} onClick={()=>{this.props.handleChange("Favorite Posts of ", `${this.state.active_user.first_name} ${this.state.active_user.last_name}`);}}>
          <ListItem>
            <ListItemText primary={`Your Favorites`} />
          </ListItem>
        </Link>
      );
    }

    return this.state.allUsers ? (
      <div>
        <List component="nav">
          {users}
          <br />
          {favs}
        </List>

      </div>
    ) : <div></div>;
  }
}

export default UserList;
