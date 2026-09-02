import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DynamicPage from './DynamicPage';
import SectionPage from './SectionPage';

export default function SmartRouter() {
    const { section } = useParams<{ section: string }>();
    const [pageExists, setPageExists] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!section) {
            setPageExists(false);
            setLoading(false);
            return;
        }

        setLoading(true);

        supabase
            .from('pages')
            .select('id')
            .eq('slug', section)
            .eq('is_published', true)
            .maybeSingle()
            .then(({ data, error }) => {
                console.log('SmartRouter check for:', section, 'Result:', data, 'Error:', error);
                setPageExists(!!data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('SmartRouter error:', err);
                setPageExists(false);
                setLoading(false);
            });
    }, [section]);

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
        );
    }

    if (pageExists) {
        return <DynamicPage />;
    }

    return <SectionPage />;
}
