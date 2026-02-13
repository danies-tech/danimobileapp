import renderer from 'react-test-renderer';
import HomeScreen from '../app/(tabs)/home';

describe('home', () => {
  it('renders', () => {
    const tree = renderer.create(<HomeScreen />).toJSON();
    expect(tree).toBeTruthy();
  });
});
