import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DynamicPage from './DynamicPage';
import SectionPage from './SectionPage';

export default function SmartRouter() {
    const { section } = useParams<{ section: string }>();
    const [isPage, setIsPage] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;

        async function checkPage() {
            if (!section) {
                setIsPage(false);
                setIsChecking(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('pages')
                    .select('id')
                    .eq('slug', section)
                    .eq('is_published', true)
                    .maybeSingle();

                if (!mounted) return;

                if (error) {
                    console.error('SmartRouter error:', error);
                    setIsPage(false);
                } else {
                    setIsPage(!!data);
                }
            } catch (err) {
                console.error('SmartRouter exception:', err);
                if (mounted) setIsPage(false);
            } finally {
                if (mounted) setIsChecking(false);
            }
        }

        checkPage();

        return () => {
            mounted = false;
        };
    }, [section]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return isPage ? <DynamicPage /> : <SectionPage />;
}
