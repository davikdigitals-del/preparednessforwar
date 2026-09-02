import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DynamicPage from './DynamicPage';
import SectionPage from './SectionPage';

export default function SmartRouter() {
    const { section } = useParams<{ section: string }>();
    const [pageExists, setPageExists] = useState<boolean | null>(null);

    useEffect(() => {
        if (!section) return;

        supabase
            .from('pages')
            .select('id')
            .eq('slug', section)
            .eq('is_published', true)
            .maybeSingle()
            .then(({ data }) => {
                setPageExists(!!data);
            });
    }, [section]);

    if (pageExists === null) {
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
