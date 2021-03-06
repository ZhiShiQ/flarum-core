import Page from './Page';
import ItemList from '../../common/utils/ItemList';
import affixSidebar from '../utils/affixSidebar';
import UserCard from './UserCard';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import SelectDropdown from '../../common/components/SelectDropdown';
import LinkButton from '../../common/components/LinkButton';
import Separator from '../../common/components/Separator';
import listItems from '../../common/helpers/listItems';

/**
 * The `UserPage` component shows a user's profile. It can be extended to show
 * content inside of the content area. See `ActivityPage` and `SettingsPage` for
 * examples.
 *
 * @abstract
 */
export default class UserPage extends Page {
  init() {
    super.init();

    /**
     * The user this page is for.
     *
     * @type {User}
     */
    this.user = null;

    this.bodyClass = 'App--user';
  }

  view() {
    return (
      <div className="UserPage">
        {this.user ? [
          UserCard.component({
            user: this.user,
            className: 'Hero UserHero',
            editable: this.user.canEdit() || this.user === app.session.user,
            controlsButtonClassName: 'Button'
          }),
          <div className="container">
            <div className="sideNavContainer">
              <nav className="sideNav UserPage-nav" config={affixSidebar}>
                <ul>{listItems(this.sidebarItems().toArray())}</ul>
              </nav>
              <div className="sideNavOffset UserPage-content">
                {this.content()}
              </div>
            </div>
          </div>
        ] : [
          LoadingIndicator.component({className: 'LoadingIndicator--block'})
        ]}
      </div>
    );
  }

  /**
   * Get the content to display in the user page.
   *
   * @return {VirtualElement}
   */
  content() {
  }

  /**
   * Initialize the component with a user, and trigger the loading of their
   * activity feed.
   *
   * @param {User} user
   * @protected
   */
  show(user) {
    this.user = user;

    app.setTitle(user.displayName());

    m.redraw();
  }

  /**
   * Given a username, load the user's profile from the store, or make a request
   * if we don't have it yet. Then initialize the profile page with that user.
   *
   * @param {String} username
   */
  loadUser(username) {
    const lowercaseUsername = username.toLowerCase();

    app.store.all('users').some(user => {
      if (user.username().toLowerCase() === lowercaseUsername && user.joinTime()) {
        this.show(user);
        return true;
      }
    });

    if (!this.user) {
      app.store.find('users', username).then(this.show.bind(this));
    }
  }

  /**
   * Build an item list for the content of the sidebar.
   *
   * @return {ItemList}
   */
  sidebarItems() {
    const items = new ItemList();

    items.add('nav',
      SelectDropdown.component({
        children: this.navItems().toArray(),
        className: 'App-titleControl',
        buttonClassName: 'Button'
      })
    );

    return items;
  }

  /**
   * Build an item list for the navigation in the sidebar.
   *
   * @return {ItemList}
   */
  navItems() {
    const items = new ItemList();
    const user = this.user;

    items.add('posts',
      LinkButton.component({
        href: app.route('user.posts', {username: user.username()}),
        children: [app.translator.trans('core.forum.user.posts_link'), <span className="Button-badge">{user.commentCount()}</span>],
        icon: 'far fa-comment'
      }),
      100
    );

    items.add('discussions',
      LinkButton.component({
        href: app.route('user.discussions', {username: user.username()}),
        children: [app.translator.trans('core.forum.user.discussions_link'), <span className="Button-badge">{user.discussionCount()}</span>],
        icon: 'fas fa-bars'
      }),
      90
    );

    if (app.session.user === user) {
      items.add('separator', Separator.component(), -90);
      items.add('settings',
        LinkButton.component({
          href: app.route('settings'),
          children: app.translator.trans('core.forum.user.settings_link'),
          icon: 'fas fa-cog'
        }),
        -100
      );
    }

    return items;
  }
}
