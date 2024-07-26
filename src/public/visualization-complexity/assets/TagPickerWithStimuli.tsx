// import { ref } from 'firebase/storage';
import { TagPicker } from 'rsuite';
import 'rsuite/styles/index.less'; // or 'rsuite/dist/rsuite.min.css'

const data = ['Eugenia', 'Bryan', 'Linda', 'Nancy', 'Lloyd', 'Alice', 'Julia', 'Albert'].map(
  (item) => ({
    label: item,
    value: item,
  }),
);

let selectedTags: string[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Picker({ parameters, setAnswer }: { parameters: any, setAnswer: any }) {
  const stimuli = parameters.stimulusNumber;
  // eslint-disable-next-line no-console
  // console.log(parameters);
  // eslint-disable-next-line no-console
  // console.log(parameters.stimulusNumber);
  let imgPath = '/src/public/visualization-complexity/assets/stimuli/stimulus';
  imgPath = imgPath.concat(stimuli);
  imgPath = imgPath.concat('.jpg');
  return (
    <div className="tagPicker">
      <img
        className="stimuli"
        style={{ maxWidth: '100%', width: 800 }}
        src={imgPath}
      />
      <br />
      <br />
      <p>What was the main reasons for choosing this complexity rating? Select the appropriate tags or create a new one.</p>
      <TagPicker
        creatable
        data={data}
        style={{ width: 300 }}
        menuStyle={{ width: 300 }}
        onCreate={(value, item) => {
          // eslint-disable-next-line no-console
          console.log(value, item);
          selectedTags = Array.of(value);
          // eslint-disable-next-line no-console
          console.log(selectedTags);
          // setAnswer({
          //   status: true,
          //   provenanceGraph: undefined,
          //   answers: {
          //     tags: selectedTags,
          //   },
          // });
        }}
        onChange={(value, item) => {
          // eslint-disable-next-line no-console
          console.log(value, item);
          selectedTags = Array.of(value);
          // eslint-disable-next-line no-console
          console.log(selectedTags);
          if (selectedTags[0].length > 0) {
            // eslint-disable-next-line no-console
            console.log('Setting the answer to true');
            setAnswer({
              status: true,
              provenanceGraph: undefined,
              answers: {
                tags: selectedTags,
              },
            });
          } else {
            // eslint-disable-next-line no-console
            console.log('No answer given, e.g. they have removed all selections');
            setAnswer({
              status: false,
              provenanceGraph: undefined,
              answers: {
                tags: selectedTags,
              },
            });
          }
        }}
      />
    </div>
  );
}

export default Picker;
