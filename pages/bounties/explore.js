import React, { Component } from 'react';
import {
  Button,
  Table,
  Container,
  Divider,
  Header,
  Loader,
  Dimmer,
} from 'semantic-ui-react';
import { Link } from '../../routes';
import axios from 'axios';
import Layout from '../../components/Layout';
import Head from '../../components/Head';
import QuestionRow from '../../components/QuestionRow';
import bounty from '../../contractInstance';
import web3 from '../../getWeb3';
import Status from '../../components/Status';

class ExploreBounty extends Component {
  constructor() {
    super();
    this.state = {
      bountyCount: 0,
      bounties: [],
      isLoading: true,
      userAccount: '',
      networkId: 4, // Default to Rinkeby, but check later anyway.
    };
  }

  async componentDidMount() {
    // Get the brower users's account details.
    const accounts = await web3.eth.getAccounts();
    this.setState({ userAccount: accounts[0] });

    // Get the network ID.
    const networkId = await web3.eth.net.getId();
    this.setState({ networkId });

    // Get the number of bounties in the contract.
    let bountyCount = await bounty.getBountyCount.call();
    bountyCount = bountyCount.toNumber();

    // Get all the bounties from the contract.
    const bounties = await Promise.all(
      Array(bountyCount).fill().map((element, index) => {
        return bounty.bounties.call(index);
      })
    );

    // There may be no active bounties...
    if (bountyCount > 0) {
      // Get all the question IDs from the bounties.
      const ids = Array(bountyCount).fill().map((element, index) => {
        return bounties[index][1].toNumber();
      });

      // Catenate the question IDs.
      const idString = ids.join(';');

      // Get the questions from Stack Exchange in a single request.
      const data = await axios.get(`https://api.stackexchange.com/2.2/questions/${idString}?site=ethereum&key=fMcgqnTvxidY8Sk8n1BcbQ((`);

      // Get the question title and the link from the returned question.
      // Push them onto each of their respective bounties in the array.
      data.data.items.map((item, index) => {
        bounties[index].push(item.link);
        bounties[index].push(item.title);
      });
    }

    this.setState({ bountyCount, bounties, isLoading: false });
  }

  renderRow() {
    return this.state.bounties.map((bounty, index) => {
      return <QuestionRow
        key={index}
        id={index}
        bounty={bounty}
        userAccount={this.state.userAccount}
      />;
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;
    return (
      <Layout>
        <Container>
          <Head
            title="Open Bounties"
            type="explore"
            userAccount={this.state.userAccount}
            networkId={this.state.networkId}
          />
          <Dimmer.Dimmable active>
            <Dimmer active={this.state.isLoading} inverted>
              <Loader inverted></Loader>
            </Dimmer>
            <Table>
              <Header>
                <Row>
                  <HeaderCell>ID</HeaderCell>
                  <HeaderCell>Question Title and Link</HeaderCell>
                  <HeaderCell>Bounty Value</HeaderCell>
                  <HeaderCell>Actions</HeaderCell>
                </Row>
              </Header>
              <Body>
                {this.renderRow()}
              </Body>
            </Table>
          </Dimmer.Dimmable>
          Found {this.state.bountyCount} active bounties.
        </Container>
      </Layout>
    );
  }
}

export default ExploreBounty;