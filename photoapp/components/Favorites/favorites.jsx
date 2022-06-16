import React from 'react';
import { Card, CardHeader, CardActionArea, CardMedia, Grid, CardActions, Button}from '@material-ui/core';
// import './userList.css';
// import {Link} from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';


/**
 * Define UserList, a React componment of CS142 project d5
 */
class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: undefined,
      favorites_users: undefined,
      showModal: false,
      curr_photo: undefined,
      comment_error: "",
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }

  handleRemove(photo_id) {
    // let photo_id = this.state.cur_photo._id;
    axios.post(`/favoritesInfo`, {photo_id: photo_id})
    .then(() => {
        axios.get('/favorites').then((response) => {
            // console.log(response.data)
            axios.post('/photo', {photo_ids: response.data}).then((res) => {
                this.setState({favorites: res.data});
                axios.post(`/usersdata`, {user_ids: res.data.map(p => p.user_id)}).then((ures) => {
                    this.setState({favorites_users: ures.data});
                  }).catch((err3) => {console.log(err3);});
            }).catch((err2) => {console.log(err2);});
        }).catch((err) => {console.log(err);});
    }).catch(err => {this.setState({comment_error: err.response.data});});
  }

  componentDidMount() {
    axios.get('/favorites').then((response) => {
        // console.log(response.data)
        axios.post('/photo', {photo_ids: response.data}).then((res) => {
            this.setState({favorites: res.data});
            axios.post(`/usersdata`, {user_ids: res.data.map(p => p.user_id)}).then((ures) => {
                this.setState({favorites_users: ures.data});
              }).catch((err3) => {console.log(err3);});
        }).catch((err2) => {console.log(err2);});
    }).catch((err) => {console.log(err);});
  }

  render() {
    let favs;
    if (this.state.favorites !== undefined && this.state.favorites_users !== undefined) {
      favs = this.state.favorites.map((photo, i) => {
        return (
        <div key={'cards'}>
            <Card key={i} style={{ margin: 20, flex:1, alignItem: 'center'}}>
                <CardActions style={{justifyContent: 'flex-end'}}>
                    <Button>
                        <DisabledByDefaultIcon onClick={() => {
                            this.handleRemove(photo._id);}}/>
                    </Button>
                </CardActions>
              {/* <Link to={`/photos/${this.state.favorites_users[i]._id}`}> */}
                <CardActionArea onClick={() => {
                    this.setState({curr_photo: photo});
                    // this.setState({curr_user: this.state.favorites_users[i]});
                    this.handleOpenModal();
                }}>
                    <CardMedia
                      style={{
                        // width: '60%',
                        maxBlockSize: '60vmax',
                        alignItem: "center",
                      }}
                      component="img"
                      image={`/images/${photo.file_name}`}
                  />
                </CardActionArea>
            </Card>
        </div>
      );});
    }
    return this.state.favorites ? 
    (
      <div>
          {this.state.comment_error}
        <Grid component="nav"
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center">
            {favs}
            {this.state.curr_photo !== undefined ? 
            (
            <div key={'modals'}>
            <Modal 
                isOpen={this.state.showModal}
                ariaHideApp={false}
                contentLabel="Minimal Modal Example"
            > 
                <Grid container 
                    direction="column"
                    alignItems="center"
                    justify="center">
                    <Card key={this.state.curr_photo._id} style={{ margin: 20, width: '60%', flex:1, alignItem: 'center'}}>
                        <CardHeader
                            title={`Posted on ${this.state.curr_photo.date_time}`}
                            action={<ExitToAppIcon onClick={this.handleCloseModal}/>}
                            />
                            <div
                            style={{
                                display: "flex",
                                alignItem: "center",
                                // width: '60%',
                                justifyContent: "center"
                            }}>
                                    <CardMedia
                                    style={{
                                    }}
                                    component="img"
                                    image={`/images/${this.state.curr_photo.file_name}`}
                                />
                            </div>
                    </Card>
                </Grid>
            </Modal> 
            </div> 
            ) : <div></div>}
        </Grid>
      </div>
    ) : `You have no favorite posts!`;
  }
}



export default Favorites;
