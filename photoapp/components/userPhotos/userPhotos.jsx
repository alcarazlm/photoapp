import React from 'react';
import {
  // 
  Card, Grid, CardHeader, CardMedia, CardContent, Typography, Button, 
} from '@material-ui/core';
import {Link} from 'react-router-dom';
import './userPhotos.css';
// import fetchModel from '../../lib/fetchModelData';
// import { Block } from '@material-ui/icons';
import axios from 'axios';
import { MentionsInput, Mention } from 'react-mentions';
import { Checkbox } from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: undefined,
      userInfo: undefined,
      new_comment: "",
      photo_id:  undefined,
      comment_error: "",
      allUsers: undefined,
      // fav_photo: false,
      mentions: [],
      active_user: undefined
    };
    this.handelComment = this.handelComment.bind(this);
  }
  componentDidMount() {
    axios.get(`/photosOfUser/${this.props.match.params.userId}`).then((response) => {
      this.setState({photos: response.data});
    }).catch((err) => {console.log(err);});
    axios.get(`/user/${this.props.match.params.userId}`).then((response) => {
      this.setState({userInfo: response.data});
      this.props.handleChange("Photos of ", `${this.state.userInfo?.first_name} ${this.state?.userInfo?.last_name}`);
    }).catch((err) => {console.log(err);});
    axios.get('/userlist').then((response) => {
      // console.log(response.data);
      this.setState({allUsers: response.data});})
    .catch((err) => {console.log(err);});
    axios.get('/loginuser').then((response) => {
      this.setState({active_user: response.data});
    }).catch((err) => {console.log(err);});
  }
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      axios.get(`/user/${this.props.match.params.userId}`).then((response) => {
        this.setState({userInfo: response.data});
        this.props.handleChange("Photos of ", `${this.state.userInfo?.first_name} ${this.state.userInfo?.last_name}`);
      }).catch((err) => {console.log(err);});
    }
    // if (prevProps.match.params.favorites !== this.props.match.params.favorites) {
    //   console.log("here");
    //   axios.get('/loginuser').then((response) => {
    //     this.setState({active_user: response.data});
    //   }).catch((err) => {console.log(err);});
    // }
  }

  addMention = (event) => {
    let user_id = event;
    // let name = undefined;
    let user;
    axios.get(`/user/${user_id}`).then((response) => {
      user = response.data;
      if(!this.state.mentions.some(person => person.name === `${user.first_name} ${user.last_name}`)){
        this.state.mentions.push({id: user._id, name:`${user.first_name} ${user.last_name}`});
      }
    }).catch((err) => {console.log(err);});
  };

  handleMention = (event) => {
    axios.post(`/mentions/${event}`, {photo_id: this.state.photo_id, user_id: event})
    .then().catch(err => {this.setState({comment_error: err.response.data});});
  };

  handelComment(photo_id) {
    // console.log(this.state.new_comment)
    axios.post(`/commentsOfPhoto/${photo_id}`, {comment: this.state.new_comment})
    .then((res) => {
      axios.get(`/photosOfUser/${res.data.user_id}`).then((response) => {
        this.setState({photos: response.data});
        // console.log(response.data);
      }).catch((err) => {this.setState({comment_error: err.response.data});});
      this.setState({new_comment: ''});
    }).catch(err => {this.setState({comment_error: err.response.data});});
  }

  handleFavorite(photo_id) {
    // console.log('here');
    // console.log(this.state.)
    // let photo_id = this.state.fav_photo;
    axios.post(`/favoritesInfo`, {photo_id: photo_id})
    .then((res) => {
      this.setState({active_user: res.data});
      axios.get(`/photosOfUser/${this.props.match.params.userId}`).then((response) => {
        this.setState({photos: response.data});
      }).catch((err) => {console.log(err);});
      // this.setState({photos: res.data.})
    }).catch(err => {this.setState({comment_error: err.response.data});});

  }

  render() {
    let userPhotos;
    // console.log(this.state.photos);
    // console.log(this.state.active_user);
    if (this.state.photos !== undefined && this.state.userInfo !== undefined) {
      userPhotos = this.state.photos.map(photo => {
        // console.log(this.state.active_user !== undefined && this.state.active_user.favorites.includes(photo._id) && photo.favorites.includes(this.state.active_user._id));
        // console.log(photo._id);
        let userP = this.state.userInfo;
        let pcomments = photo.comments?.map(c => (
          <Card sx={4} key={c._id}>
            <CardHeader
              titleTypographyProps={{variant:'h5' }}
              title={<Link to={`/users/${c.user._id}`} onClick={()=>{this.props.handleChange("Details of ",`${c.user.first_name} ${c.user.last_name}`);}}>{c.user.first_name} {c.user.last_name}</Link>}
              subheader={`Posted on ${c.date_time}`}
            />
            <CardContent>
              <Typography variant="body2">
                {c.comment}
              </Typography>
            </CardContent>
          </Card>
        ));
        let empty = pcomments !== undefined;
        return (
          <div style={{ 
            padding: 30, 
            width: '75%'
            }} key={photo.file_name}>
            <Card sx={4}>
              <CardHeader
                title={`${userP.first_name} ${userP.last_name}`}
                subheader={`Posted on ${photo.date_time}`}
                action={(
                  <Checkbox checked={this.state.active_user !== undefined && this.state.active_user.favorites.includes(photo._id) && photo.favorites.includes(this.state.active_user._id)} 
                  onChange={() => this.handleFavorite(photo._id)} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
                )}
              />
              <div
                style={{
                  display: "flex",
                  alignItem: "center",
                  justifyContent: "center"
                }}>
                <CardMedia
                  style={{
                    width: "auto",
                    // maxHeight: "200px"
                  }}
                  component="img"
                  image={`/images/${photo.file_name}`}
                />
              </div>
              <CardContent>
                <div>
                  <CardHeader title={<h5>Comments:</h5>}/>
                  {/* Comments:  */}
                  {/* <br/> */}
                  {empty ? pcomments: `This post has no comments yet!`}
                  {/* <Typography>Write a new comment!</Typography> */}
                  <CardHeader title={<h6>Write a new comment!</h6>}/>
                  <MentionsInput
                    // singleLine
                    value={this.state.new_comment}
                    allowSpaceInQuery
                    onChange={(event) => {
                      this.setState({new_comment: event.target.value});
                      this.setState({photo_id: photo._id});
                    }}
                    a11ySuggestionsListLabel={"Suggested mentions"}
                    allowSuggestionsAboveCursor={true}
                  >
                    {/* <Link> */}
                    <Mention trigger="@" data={this.state.allUsers} onAdd={(event) => {this.addMention(event);}} markup='@__display__' />
                    {/* </Link> */}
                  </MentionsInput>
                  <Typography>{this.state.comment_error}</Typography>
                  <Button onClick={() => {
                    this.handelComment(this.state.photo_id);
                    if (this.state.mentions.length !== 0) {
                      this.state.mentions.map((user) => {
                        let regx = new RegExp(`@${user.name}`);
                        if (regx.test(this.state.new_comment)) {
                          return this.handleMention(user.id);
                        }
                        return 'No Mention';
                      });
                    }}}>Post
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        );
      });
    }
    return this.state.photos && this.state.userInfo ? (
      <Grid container
      // display={Block}
      // overflow={'visible'}
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center">
          {userPhotos}
      </Grid>
    ) : <div></div>;
  }
}

export default UserPhotos;