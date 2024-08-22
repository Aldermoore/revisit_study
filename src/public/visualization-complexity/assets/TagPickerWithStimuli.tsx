// import { ref } from 'firebase/storage';
import { TagPicker } from 'rsuite';
import 'rsuite/styles/index.less'; // or 'rsuite/dist/rsuite.min.css'
import SpinnerIcon from '@rsuite/icons/legacy/Spinner';

import {
  collection, getDocs, addDoc, updateDoc,
  Firestore, query, where, doc,
  limit,
  getDoc,
} from 'firebase/firestore';
import React, { ReactNode } from 'react';
import { FirebaseStorageEngine } from '../../../storage/engines/FirebaseStorageEngine';
import { PREFIX } from '../../../utils/Prefix';

const app = new FirebaseStorageEngine();
// eslint-disable-next-line no-console
console.log(app);
const db = app.firestore;
// eslint-disable-next-line no-console
console.log(db);

// Get a list of tags from your database
async function getTags(database: Firestore) {
  const tagsCol = collection(database, 'tags');
  const tagsSnapshot = await getDocs(tagsCol);
  const tagsList = tagsSnapshot.docs.map((docu) => docu.data());
  return tagsList;
}

// Get a list of tags from your database
async function addTag(database: Firestore, newTag: string) {
  try {
    const docRef = await addDoc(collection(db, 'tags'), {
      name: newTag,
      count: 0,
    });
    // eslint-disable-next-line no-console
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding tag to firebase: ', e);
  }
}

async function incrementTagCounter(database: Firestore, tagName: string) {
  const tagsCol = collection(database, 'tags');
  const q = query(tagsCol, where('name', '==', tagName), limit(1));
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docu) => {
      // doc.data() is never undefined for query doc snapshots
      // eslint-disable-next-line no-console
      console.log('fetched count for the tag:', docu.data().count, docu.id, 'should be', docu.data().count + 1, 'soon on firebase');
      const tagToIncrement = doc(database, 'tags', docu.id);
      try {
        const docSnap = await getDoc(tagToIncrement);
        // eslint-disable-next-line no-console
        const oldCount: number = docSnap?.data()?.count;
        const newCount: number = oldCount + 1;
        await updateDoc(tagToIncrement, {
          count: newCount,
        });
      } catch (error) {
        console.error('Failed to get document:', error);
      }
    });
    // eslint-disable-next-line no-console
    console.log('Counter incremented successfully');
  } catch (e) {
    console.error('Error updating tag to firebase: ', e);
  }
}

async function decrementTagCounter(database: Firestore, tagName: string) {
  const tagsCol = collection(database, 'tags');
  const q = query(tagsCol, where('name', '==', tagName), limit(1));
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docu) => {
      // doc.data() is never undefined for query doc snapshots
      // eslint-disable-next-line no-console
      console.log('fetched count for the tag:', docu.data().count, docu.id);
      const tagToIncrement = doc(database, 'tags', docu.id);
      try {
        const docSnap = await getDoc(tagToIncrement);
        // eslint-disable-next-line no-console
        console.log(docSnap?.data()?.count, docSnap.id);
        const oldCount: number = docSnap?.data()?.count;
        let newCount: number = oldCount - 1;
        if (newCount < 0) {
          newCount = 0;
        }
        await updateDoc(tagToIncrement, {
          count: newCount,
        });
      } catch (error) {
        console.error('Failed to get document:', error);
      }
    });
    // eslint-disable-next-line no-console
    console.log('Counter decremented successfully');
  } catch (e) {
    console.error('Error updating tag to firebase: ', e);
  }
}

type tagType = { label: string; value: string; };

let data = ['Big dataset', 'Many different shapes', 'Irregular shapes', 'Confusing layout', 'Confusing background', 'Multiple charts', 'Too small', 'Many colors', 'Poor contrast', '3D effect', 'Not complex']
  .map(
    (item) => ({
      label: item,
      value: item,
    }),
  );

const defaultTagsData = ['Big dataset', 'Many different shapes', 'Irregular shapes', 'Confusing layout', 'Confusing background', 'Multiple charts', 'Too small', 'Many colors', 'Poor contrast', '3D effect', 'Not complex'].map(
  (item) => ({
    label: item,
    value: item,
  }),
);

async function getTagsData(database: Firestore) {
  const tagnames: string[] = [];
  const taglist: { tagName: string; count: number; }[] = [];
  getTags(database).then((tagsdata) => {
    tagsdata.forEach((tagdoc) => {
      const tempTagObj = { tagName: 'A', count: 0 };
      taglist.push(tempTagObj);
      tempTagObj.tagName = tagdoc.name;
      tempTagObj.count = tagdoc.count;
    });
    taglist.sort((a, b) => b.count - a.count);
    // eslint-disable-next-line guard-for-in
    for (const i in taglist) { tagnames.push(taglist[i].tagName); }
    // eslint-disable-next-line no-console
    console.log(tagnames);
    data = tagnames.map(
      (item) => ({
        label: item,
        value: item,
      }),
    );
  });
}
let oldStimuli = '';
let selectedTags: string[] = [];
let oldTags: string[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Picker({ parameters, setAnswer }: { parameters: any, setAnswer: any }) {
  const stimuli = parameters.stimulusNumber;

  if (stimuli !== oldStimuli) {
    selectedTags = [];
    // eslint-disable-next-line no-console
    console.log('resetting selected tags');
    oldStimuli = stimuli;
  }

  const [items, setItems] = React.useState<tagType[]>([]);
  const updateData = () => {
    const tagnames: string[] = [];
    const taglist: { tagName: string; count: number; }[] = [];
    getTags(db).then((tagsdata) => {
      tagsdata.forEach((tagdoc) => {
        const tempTagObj = { tagName: 'A', count: 0 };
        taglist.push(tempTagObj);
        tempTagObj.tagName = tagdoc.name;
        tempTagObj.count = tagdoc.count;
      });
      taglist.sort((a, b) => b.count - a.count);
      // eslint-disable-next-line guard-for-in
      for (const i in taglist) { tagnames.push(taglist[i].tagName); }
      data = tagnames.map(
        (item) => ({
          label: item,
          value: item,
        }),
      );
      // eslint-disable-next-line no-console
      console.log(data);
      if (items.length === 0) {
        setItems(data);
      }
    });
  };

  const renderMenu = (menu: ReactNode) => {
    if (items.length === 0) {
      return (
        <p style={{ padding: 4, color: '#999', textAlign: 'center' }}>
          <SpinnerIcon spin />
          {' '}
          Loading...
        </p>
      );
    }
    return menu;
  };

  let imgPath = `${PREFIX}visualization-complexity/assets/stimuli/stimulus`;
  imgPath = imgPath.concat(stimuli);
  imgPath = imgPath.concat('.jpg');
  return (
    <div className="tagPicker">
      <p>What was the main reasons for choosing this complexity rating? Select the appropriate tags or create a new one.</p>
      <TagPicker
        creatable
        cleanable={false}
        data={items}
        cacheData={defaultTagsData}
        style={{ maxWidth: 800, width: '100%', maxHeight: 600 }}
        // block
        renderMenu={renderMenu}
        onOpen={() => {
          updateData();
        }}
        onCreate={(value, item) => {
          // eslint-disable-next-line no-console
          console.log(value, item);
          selectedTags = (value);
          // eslint-disable-next-line no-console
          console.log(selectedTags);
          addTag(db, String(item.value));
        }}
        onSelect={(value, item) => {
          // eslint-disable-next-line no-console
          console.log('selectedTags:', selectedTags.length, '\ncurrent value:', value.length, '\noldTags:', oldTags.length);

          if (selectedTags.length > value.length) {
            // eslint-disable-next-line no-console
            console.log('A tag needs to be removed:', item.value);
            decrementTagCounter(db, String(item.value));
          } else if (selectedTags.length < value.length) {
            // eslint-disable-next-line no-console
            console.log('A tag needs to be added:', item.value);
            incrementTagCounter(db, String(item.value));
          } else {
            // eslint-disable-next-line no-console
            console.log('selectedTags and the current value are equal. This should NOT happen!!', item.value);
          }

          oldTags = value;
          selectedTags = value;

          if (selectedTags.length > 0) {
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
        onTagRemove={(value, item) => { // onChange
          // eslint-disable-next-line no-console
          console.log(value, item);
          decrementTagCounter(db, value);
          const newTags = selectedTags.filter((e) => e !== value);
          selectedTags = newTags;
        }}
        onEnter={() => {
          getTagsData(db);
        }}
      />
      <br />
      <br />
      <img
        className="stimuli"
        style={{ maxWidth: '100%', width: 800 }}
        src={imgPath}
      />
    </div>
  );
}

export default Picker;
