import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../../../helpers/Axios';

export default function useCreateUser() {
  const createUser = (data) => axios.post('/users.json', data);
  const inferUserLang = () => {
    const language = window.navigator.userLanguage || window.navigator.language;
    return language.match(/^[a-z]{2,}/)?.at(0);
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('location');

  const mutation = useMutation(
    createUser,
    { // Mutation config.
      onError: () => { toast.error('There was a problem completing that action. \n Please try again.'); },
      onSuccess: (response) => {
        queryClient.invalidateQueries('useSessions');
        // if the current user does NOT have the CreateRoom permission, then do not re-direct to rooms page
        if (redirect) {
          navigate(redirect);
        } else if (response.data.data.permissions.CreateRoom === 'false') {
          navigate('/home');
        } else {
          navigate('/rooms');
        }
      },
    },
  );
  const onSubmit = (user, token) => {
    const userData = { ...user, language: inferUserLang() };
    return mutation.mutateAsync({ user: userData, token }).catch(/* Prevents the promise exception from bubbling */() => { });
  };
  return { onSubmit, ...mutation };
}
