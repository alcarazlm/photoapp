import React from 'react';
import {
  Typography, Grid, CardHeader, CardMedia, Card, CardContent, CardActionArea
} from '@material-ui/core';
import './userDetail.css';
import {Link} from 'react-router-dom';
// import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      recent_photo: undefined,
      recent_user: undefined,
      most_comments_photo: undefined,
      most_comments_user: undefined,
      mention_photos: [],
      mention_users: []
    };
  }
  componentDidMount() {
    axios.get(`/user/${this.props.match.params.userId}`).then((response) => {
      let user = response.data;
      this.setState({userInfo: user});
      this.props.handleChange(`${user.first_name} ${user.last_name}`);
      if (user.mentions.length !== 0) {
        axios.post(`/photo`, {photo_ids: user.mentions}).then((res) => {
          let photos = res.data;
          this.setState({mention_photos: photos});
          axios.post(`/usersdata`, {user_ids: photos.map(p => p.user_id)}).then((ures) => {
            this.setState({mention_users: ures.data});
          }).catch((err7) => {console.log(err7);});
        }).catch((err2) => {console.log(err2);});
      }
      axios.get(`/mostcomment/${user._id}`).then((cresponse) => {
        let photo = cresponse.data;
        this.setState({most_comments_photo: photo});
        axios.get(`/userdata/${photo.user_id}`).then((cres) => {
          this.setState({most_comments_user: cres.data});
        }).catch((err5) => {console.log(err5);});
      }).catch((err3) => {console.log(err3);});
      axios.get(`/mostrecent/${user._id}`).then((mresponse) => {
        let photo = mresponse.data;
        this.setState({recent_photo: photo});
        axios.get(`/userdata/${photo.user_id}`).then((mres) => {
          this.setState({recent_user: mres.data});
        }).catch((err6) => {console.log(err6);});
      }).catch((err4) => {console.log(err4);});
    }).catch((err) => {console.log(err);});
  }
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      axios.get(`/user/${this.props.match.params.userId}`).then((response) => {
        let user = response.data;
        this.setState({userInfo: user});
        this.props.handleChange("Details of ", `${user.first_name} ${user.last_name}`);
        if (user.mentions.length !== 0) {
          axios.post(`/photo`, {photo_ids: user.mentions}).then((res) => {
            let photos = res.data;
            this.setState({mention_photos: photos});
            axios.post(`/usersdata`, {user_ids: photos.map(p => p.user_id)}).then((ures) => {
              this.setState({mention_users: ures.data});
            }).catch((err7) => {console.log(err7);});
          }).catch((err2) => {console.log(err2);});
        }
        axios.get(`/mostcomment/${user._id}`).then((cresponse) => {
          let photo = cresponse.data;
          this.setState({most_comments_photo: photo});
          axios.get(`/userdata/${photo.user_id}`).then((cres) => {
            this.setState({most_comments_user: cres.data});
          }).catch((err5) => {console.log(err5);});
        }).catch((err3) => {console.log(err3);});
        axios.get(`/mostrecent/${user._id}`).then((mresponse) => {
          let photo = mresponse.data;
          this.setState({recent_photo: photo});
          axios.get(`/userdata/${photo.user_id}`).then((mres) => {
            this.setState({recent_user: mres.data});
          }).catch((err5) => {console.log(err5);});
        }).catch((err4) => {console.log(err4);});
      }).catch((err) => {console.log(err);});
    }
  }

  render() {
    let user = this.state.userInfo;
    let userMentions;
    if (this.state.mention_photos.length !== 0 && this.state.mention_users.length !== 0) {
      let iter = -1;
      userMentions = this.state.mention_photos.map((photo, i) => {
        iter += 1;
        return (
          <Card key={i} style={{ marginLeft: 20, marginRight: 20, flex:1}}>
            <CardHeader
              title={
                (
                <Link to={`/users/${this.state.mention_users[iter]._id}`} key={this.state.mention_users[iter]._id} onClick={()=>{this.props.handleChange("Details of ", `${user.first_name} ${user.last_name}`);}}>
                {`${this.state.mention_users[iter].first_name} ${this.state.mention_users[iter].last_name}`}
                </Link>
                )}
              subheader={`Posted on ${photo.date_time}`}
            />
            <div
              style={{
                display: "flex",
                alignItem: "center",
                justifyContent: "center"
              }}>
              <Link to={`/photos/${this.state.mention_users[iter]._id}`}>
                <CardActionArea>
                  {/* <CardContent> */}
                    <CardMedia
                      style={{
                        // width: "auto",
                        // maxHeight: "200px"
                      }}
                      component="img"
                      image={`/images/${photo.file_name}`}
                  />
                  {/* </CardContent> */}
                </CardActionArea>
              </Link>
            </div>
            {/* <CardContent></CardContent> */}
          </Card>
        );
      });
    }
    // console.log(this.state.most_comments_photo);
    return this.state.userInfo ? (
      <Grid>
        <Typography variant="h4">
          {`${user.first_name} ${user.last_name}`}
        </Typography>
        <Typography variant="body1">
          <b>Located in:</b> {user.location}
        </Typography>
        <Typography variant="body1">
          {user.description}
        </Typography>
        <Typography variant="body1">
          <b>Occupation:</b> {user.occupation}
        </Typography>
        <Link to={`/photos/${user._id}`}>
          See {user.first_name} {user.last_name}&apos;s Photos
        </Link>
        {/* {userMentions !== undefined ? {userMentions} : `${user.first_name} ${user.last_name} has no mentions.`} */}
        {this.state.most_comments_user !== undefined && this.state.recent_user !== undefined ? (
        <div style={{display:'flex'}}>
        <Card style={{ marginLeft: 20, marginRight: 20, flex:1}}>
          <CardContent>
            <Typography>
            {`${this.state.most_comments_user.first_name}'s Most Commented Picture`}
            </Typography>
          </CardContent>
          <CardHeader
            title={`${this.state.most_comments_user.first_name} ${this.state.most_comments_user.last_name}`}
            subheader={`This post has ${this.state.most_comments_photo.comments.length} comments.`}
          />
          <div
            style={{
              display: "flex",
              alignItem: "center",
              justifyContent: "center"
            }}>
            <Link to={`/photos/${this.state.most_comments_user._id}`}>
              <CardActionArea>
                <CardMedia
                  style={{
                    // width: "auto",
                    // maxHeight: "200px"
                  }}
                  component="img"
                  image={`/images/${this.state.most_comments_photo.file_name}`}
                />
              </CardActionArea>
            </Link>
          </div>
          {/* <CardContent></CardContent> */}
        </Card>
        <Card style={{ marginLeft: 20, marginRight: 20, flex:1}}>
          <CardContent>
            <Typography>
            {`${this.state.recent_user.first_name}'s Most Recent Picture`}
            </Typography>
          </CardContent>
          <CardHeader
            title={`${this.state.recent_user.first_name} ${this.state.recent_user.last_name}`}
            subheader={`Posted on ${this.state.recent_photo.date_time}`}
          />
          <div
            style={{
              display: "flex",
              alignItem: "center",
              justifyContent: "center"
            }}>
            <Link to={`/photos/${this.state.recent_user._id}`}>
              <CardActionArea>
                <CardMedia
                  style={{
                    // width: "auto",
                    // maxHeight: "200px"
                  }}
                  component="img"
                  image={`/images/${this.state.recent_photo.file_name}`}
                />
              </CardActionArea>
            </Link>
          </div>
          {/* <CardContent></CardContent> */}
        </Card>
        </div>
        ) : <div></div>
        }
        {/* <Typography> */}
          {/* {`${user.first_name} ${user.last_name} has no mentions.`} */}
        
        {/* </Typography> */}
        <div style={{display:'flex'}}>
          {userMentions !== undefined ? (
            <Card style={{ marginLeft: 20, marginRight: 20, flex:1}}>
              <CardHeader
               title={`Mentioned in:`}/>
              <CardContent>
                {userMentions}
              </CardContent>
            </Card>
            ) : `${user.first_name} ${user.last_name} has no mentions.`}
        </div>
      </Grid>
      
    ) : <div></div>;
  }
}

export default UserDetail;

