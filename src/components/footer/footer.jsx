import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
} from '@material-ui/core';
import { colors } from '../../theme'

import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DescriptionIcon from '@material-ui/icons/Description';
import ForumIcon from '@material-ui/icons/Forum';
import BarChartIcon from '@material-ui/icons/BarChart';

const styles = theme => ({
  footer: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-evenly',
    width: '100%',
    background: colors.white,
    borderRadius: '50px 50px 0px 0px',
    border: '1px solid '+colors.borderBlue,
    borderBottom: 'none',
    marginTop: '48px',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-start',
    }
  },
  heading: {
    marginBottom: '12px',
    paddingBottom: '9px',
    borderBottom: "3px solid "+colors.borderBlue,
    width: 'fit-content',
    marginLeft: '30px'
  },
  link: {
    paddingBottom: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  icon: {
    fill: colors.borderBlue,
    marginRight: '6px'
  },
  yearnIcon: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  builtWith:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    }
  },
  builtWithLink: {
    paddingTop: '12px'
  },
  builtHeading: {
    marginBottom: '12px',
    paddingBottom: '9px',
    borderBottom: "3px solid "+colors.borderBlue,
    width: 'fit-content',
  },
  products: {
    padding: '0px 24px',
    [theme.breakpoints.down('xs')]: {
      paddingBottom: '24px'
    }
  },
  community: {
    padding: '0px 24px',
    [theme.breakpoints.down('xs')]: {
      paddingBottom: '24px'
    }
  },
  socials: {
    padding: '0px 24px'
  }
});


class Footer extends Component {

  constructor(props) {
    super()

    this.state = {
      modalBuiltWithOpen: false,
    }
  }

  render() {
    const { classes, location } = this.props;

    if(location.pathname === '' || location.pathname === '/') {
      return null
    }

    return (
      <div className={classes.footer}>
        <div className={ classes.products }>
          <Typography className={ classes.heading } variant={ 'h6'}>Products</Typography>
          <div  className={ classes.link } onClick={()=> window.open("https://governordao.org", "_blank")} >
            <AttachMoneyIcon height='15px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Governor DAO</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://mine.governorDAO.org", "_blank")} >
            <HowToVoteIcon height='15px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Liquidity Mines</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://airdrop.governorDAO.org", "_blank")} >
            <DescriptionIcon height='15px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Airdrop</Typography>
          </div>
        </div>
        <div className={ classes.community }>
          <Typography className={ classes.heading } variant={ 'h6'}>Community</Typography>
          <div  className={ classes.link } onClick={()=> window.open("https://gdao.network", "_blank")} >
            <ForumIcon height='15px' className={ classes.icon } />
            <Typography variant={ 'h4'} >gdao.network</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://reddit.com", "_blank")} >
            <BarChartIcon height='15px' className={ classes.icon } />
            <Typography variant={ 'h4'} >reddit</Typography>
          </div>
        </div>
        <div className={ classes.socials }>
          <Typography className={ classes.heading } variant={ 'h6'}>Resources</Typography>
          <div  className={ classes.link } onClick={()=> window.open("https://twitter.com/Governor_DAO", "_blank")} >
            <img alt="" src={ require('../../assets/twitter.svg') } height='24px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Twitter</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://soliditywiz.medium.com/", "_blank")} >
            <img alt="" src={ require('../../assets/medium.svg') } height='24px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Medium</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://discord.gg/HtBxjTZDy6", "_blank")} >
            <img alt="" src={ require('../../assets/discord.svg') } height='24px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Discord</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://t.me/GovernorProject", "_blank")} >
            <img alt="" src={ require('../../assets/telegram.svg') } height='24px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Telegram</Typography>
          </div>
          <div  className={ classes.link } onClick={()=> window.open("https://github.com/cryptounico", "_blank")} >
            <img alt="" src={ require('../../assets/github.svg') } height='24px' className={ classes.icon } />
            <Typography variant={ 'h4'} >Github</Typography>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(withStyles(styles)(Footer));
