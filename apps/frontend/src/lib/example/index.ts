import axios from 'redaxios';

export const getAllExamples = async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
  const data = response.data;
  return data;
};
