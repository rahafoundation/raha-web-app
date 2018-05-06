import "jest-localstorage-mock";
import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

// Setup adapter to work with enzyme 3.2.0
Enzyme.configure({ adapter: new Adapter() });
