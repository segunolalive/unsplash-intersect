import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Image from './Image';
import Modal from './Modal';

const toggleGrow = entry => {
  entry.forEach(change => {
    if (change.isIntersecting) {
      change.target.classList.add('grow');
    } else {
      change.target.classList.remove('grow');
    }
  });
};

class App extends Component {
  static getDerivedStateFromProps(props, state) {
    const { id } = props.match.params;
    const selected = id
      ? state.photos.find(photo => photo.id === Number(id))
      : null;
    return { selected };
  }

  constructor(props) {
    super(props);
    this.state = { photos: [], selected: null, page: 1, loading: false };
    this.imgObserver = this.createImageObserver();
    this.scrollObserver = this.createScrollObserver();
    this.gridRef = React.createRef();
  }

  async componentDidMount() {
    this.scrollObserver.observe(this.gridRef.current);
  }

  componentWillUnmount() {
    if (this.imgObserver) {
      this.imgObserver.disconnect();
      this.scrollObserver.disconnect();
    }
  }

  createImageObserver = () => {
    let options = {
      threshold: [0.2]
    };
    return new IntersectionObserver(toggleGrow, options);
  };

  createScrollObserver = () => {
    const options = { threshold: [0, 1], rootMargin: '300px 0px' };
    return new IntersectionObserver(this.fetchMore, options);
  };

  fetchMore = ([entry]) => {
    if (entry.isIntersecting && entry.intersectionRatio === 1) {
      this.getPhotos();
    }
  };

  getPhotos = async () => {
    const END = 'end';
    const page = this.state.photos.length !== 100 ? this.state.page : END;
    if (page !== END) {
      try {
        this.setState({ loading: true });
        const response = await fetch(
          `http://localhost:5000/photos?_page=${page}&_limit=20`
        );
        const photos = await response.json();
        this.setState({
          photos: [...this.state.photos, ...photos],
          page: this.state.page + 1,
          loading: false
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  render() {
    return (
      <>
        <div className="grid">
          {this.state.photos.map(photo => (
            <Image photo={photo} observer={this.imgObserver} key={photo.id} />
          ))}
          {this.state.loading && <h3> L O A D I N G . . . </h3>}
          <Route
            render={routerProps => (
              <Modal {...routerProps} selected={this.state.selected} />
            )}
          />
        </div>
        {/* {this.state.page === 'end' && <div> That's all folks. </div>} */}
        <span className="bottom" ref={this.gridRef} />
      </>
    );
  }
}

export default App;
