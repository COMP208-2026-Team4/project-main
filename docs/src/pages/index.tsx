import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home(): ReactNode {
  const history = useHistory();
  const gettingStartedUrl = useBaseUrl('/getting-started');

  useEffect(() => {
    history.replace(gettingStartedUrl);
  }, [history, gettingStartedUrl]);

  return null;
}
