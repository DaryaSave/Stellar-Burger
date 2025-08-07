import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { IngredientDetails } from '@components';

export const IngredientPage = () => {
  const { id } = useParams();
  const { ingredients } = useSelector((state) => state.ingredients);

  const ingredient = ingredients.find((item) => item._id === id);

  if (!ingredient) {
    return <div>Ингредиент не найден</div>;
  }

  return (
    <div>
      <h1>Детали ингредиента</h1>
      <IngredientDetails />
    </div>
  );
};
