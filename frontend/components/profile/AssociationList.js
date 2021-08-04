import AssociationListItem from './AssociationListItem'

const AssociationList = ({ title, associations }) => {
    return (
        <>
            <h2>{title}</h2>
            <ul className="column_two">
                {
                    associations.map(association => {
                        return <AssociationListItem 
                            association={association}
                        />
                    })
                }
            </ul>
        </>
    );
}

export default AssociationList;